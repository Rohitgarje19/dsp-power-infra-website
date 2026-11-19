package in.dsppowerinfra.website.config;

import in.dsppowerinfra.website.lead.LeadRateLimitInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final LeadRateLimitInterceptor leadRateLimitInterceptor;

    public WebConfig(LeadRateLimitInterceptor leadRateLimitInterceptor) {
        this.leadRateLimitInterceptor = leadRateLimitInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(leadRateLimitInterceptor)
            .addPathPatterns("/api/leads");
    }
}