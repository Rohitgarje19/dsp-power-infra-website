package in.dsppowerinfra.website.lead;
import jakarta.validation.constraints.*;
public record LeadRequest(@NotBlank @Size(min=2,max=100) String fullName,
 @NotBlank @Pattern(regexp="[+0-9 ()-]{10,20}") String phone,
 @Email @Size(max=160) String email,
 @NotBlank @Size(max=40) String customerType,
 @NotBlank @Size(max=100) String city,
 @NotBlank @Pattern(regexp="[0-9]{6}") String pincode,
 @Min(0) @Max(10000000) Integer monthlyBill,
 @Size(max=1200) String message,
 @Size(max=40) String source) {}
