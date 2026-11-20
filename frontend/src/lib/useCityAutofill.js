import { useEffect, useRef, useState } from "react";
import { cityForPincode, resolveCity } from "./serviceability";

// Shared PIN -> City autofill for the enquiry form and the calculator.
// - fills from the confirmed-region hint immediately, then refines with the
//   backend's India Post lookup for any Indian PIN;
// - never overwrites a city the visitor typed;
// - clears an auto-filled city when the PIN stops being a full 6 digits.
export function useCityAutofill(pin, initialCity = "") {
  const [city, setCity] = useState(initialCity);
  const cityRef = useRef(initialCity);
  const autoFilled = useRef(false);
  const manual = useRef(false);
  const initial = useRef(initialCity);

  useEffect(() => {
    cityRef.current = city;
  }, [city]);

  useEffect(() => {
    let cancelled = false;

    function apply(hint) {
      if (hint) {
        if (!manual.current && (!cityRef.current.trim() || autoFilled.current)) {
          autoFilled.current = true;
          cityRef.current = hint;
          setCity(hint);
        }
        return;
      }
      if (autoFilled.current && !manual.current) {
        autoFilled.current = false;
        cityRef.current = "";
        setCity("");
      }
    }

    apply(cityForPincode(pin));

    // Debounce the network lookup while the visitor is still typing.
    const timer = setTimeout(async () => {
      const hint = await resolveCity(pin);
      if (!cancelled) apply(hint);
    }, pin.length === 6 ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pin]);

  function onCityChange(value) {
    autoFilled.current = false;
    manual.current = true;
    cityRef.current = value;
    setCity(value);
  }

  function resetCity() {
    autoFilled.current = false;
    manual.current = false;
    cityRef.current = initial.current;
    setCity(initial.current);
  }

  return { city, onCityChange, resetCity };
}
