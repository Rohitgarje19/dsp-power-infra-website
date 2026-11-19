package in.dsppowerinfra.website.lead;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(
    name = "leads",
    indexes = {
        @Index(name = "idx_leads_created_at", columnList = "created_at"),
        @Index(name = "idx_leads_status", columnList = "status")
    }
)
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 160)
    private String email;

    @Column(name = "customer_type", nullable = false, length = 40)
    private String customerType;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 6)
    private String pincode;

    @Column(name = "monthly_bill")
    private Integer monthlyBill;

    @Column(length = 1200)
    private String message;

    @Column(nullable = false, length = 40)
    private String source;

    @Column(name = "source_page", length = 200)
    private String sourcePage;

    @Column(name = "utm_source", length = 100)
    private String utmSource;

    @Column(name = "utm_medium", length = 100)
    private String utmMedium;

    @Column(name = "utm_campaign", length = 100)
    private String utmCampaign;

    @Column(length = 2000)
    private String notes;

    @Column(nullable = false, length = 40)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    protected Lead() {
    }

    public Lead(
        String fullName,
        String phone,
        String email,
        String customerType,
        String city,
        String pincode,
        Integer monthlyBill,
        String message,
        String source
    ) {
        this(fullName, phone, email, customerType, city, pincode, monthlyBill, message, source, null, null, null, null);
    }

    public Lead(
        String fullName,
        String phone,
        String email,
        String customerType,
        String city,
        String pincode,
        Integer monthlyBill,
        String message,
        String source,
        String sourcePage,
        String utmSource,
        String utmMedium,
        String utmCampaign
    ) {
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.customerType = customerType;
        this.city = city;
        this.pincode = pincode;
        this.monthlyBill = monthlyBill;
        this.message = message;
        this.source = source == null || source.isBlank() ? "website" : source;
        this.sourcePage = sourcePage;
        this.utmSource = utmSource;
        this.utmMedium = utmMedium;
        this.utmCampaign = utmCampaign;
        this.status = "NEW_ENQUIRY";
        this.createdAt = Instant.now();
    }

    public void resolve() {
        this.resolvedAt = Instant.now();
        this.status = "RESOLVED";
    }

    public void restore() {
    this.resolvedAt = null;
    this.deleted = false;
    this.deletedAt = null;
    this.status = "NEW_ENQUIRY";
    }

    public void moveToDeleted() {
    this.deleted = true;
    this.deletedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getCustomerType() { return customerType; }
    public String getCity() { return city; }
    public String getPincode() { return pincode; }
    public Integer getMonthlyBill() { return monthlyBill; }
    public String getMessage() { return message; }
    public String getSource() { return source; }
    public String getSourcePage() { return sourcePage; }
    public String getUtmSource() { return utmSource; }
    public String getUtmMedium() { return utmMedium; }
    public String getUtmCampaign() { return utmCampaign; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public Instant getDeletedAt() { return deletedAt; }
    public boolean isDeleted() { return deleted; }
}
