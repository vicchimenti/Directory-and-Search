# Seattle University Website Incident Report

**Date**: September 30, 2024  
**Incident ID**: SU-WEB-20240930-001  
**Prepared by**: Seattle University Web Team  

## Executive Summary

On September 30, 2024, Seattle University experienced a brief website outage affecting the main university website and search applications. The incident duration was approximately 11-15 minutes from when issues became visible until resolution. The root cause was identified as third-party infrastructure changes to media caching configuration that impacted CSS/JavaScript asset delivery.

**Impact**: Temporary degradation of website styling and functionality  
**Duration**: ~11-15 minutes from visible impact to resolution  
**Root Cause**: Third-party infrastructure caching configuration change  
**Resolution**: Infrastructure team reverted problematic configuration  

## Incident Timeline

| Time | Event | Action Taken |
|------|-------|--------------|
| ~4:30 AM | Web team deployed routine updates | Normal deployment process |
| 7:55 AM | T4 Engineering implemented AWS media cache changes | Infrastructure modification (external) |
| ~8:20-8:25 AM | Cache TTL expired, styling issues became visible | Website styling broke due to query string handling |
| 8:23:55 AM | Web team initiated troubleshooting | Attempted rollback assuming code-related issue |
| 8:34:54 AM | Fresh deployment resolved issues | T4 had removed problematic cache rule |

## Technical Details

### Root Cause

T4 Engineering (third-party infrastructure provider) implemented changes to AWS media caching that ignored query string parameters. Seattle University's CSS and JavaScript files use query strings for cache-busting and version control. When existing cache entries reached their TTL expiration (time unknown, estimated 25-30 minutes after the change), the new caching rules prevented proper asset loading.

### Affected Systems

- Main university website (seattleu.edu)
- Law (law.seattleu.edu)
- Search applications (development and production)
- Faculty/staff profile images
- All CSS and JavaScript assets

### Why Issues Appeared Delayed

The problematic caching configuration was implemented at 7:55 AM but didn't cause visible issues until cache TTL expiration sometime around 8:20-8:25 AM. This delay created the appearance that recent code deployments were the cause, as the web team was actively testing and using the site prior to the issues becoming apparent.

## Response Actions

### Immediate Response

1. **Issue Recognition**: Web team quickly identified widespread impact across multiple systems
2. **Logical Troubleshooting**: Attempted rollback of recent code changes (standard procedure)
3. **Escalation**: When rollbacks proved ineffective, correctly identified as infrastructure issue T4
4. **Support Engagement**: Opened priority support ticket with infrastructure provider T4

### Resolution

T4 Engineering identified and resolved the issue by removing the problematic caching rule entirely. A fresh deployment by the web team at 8:34 AM confirmed full restoration of services.

## Impact Assessment

### Business Impact

- **Duration**: 11-15 minutes of degraded service from visible impact to resolution
- **Scope**: University-wide website functionality
- **User Experience**: Broken styling, navigation issues, missing images
- **Critical Functions**: No loss of core university operations

### Technical Impact

- seattleu.edu and law.seattleu.edu web properties affected simultaneously
- CSS/JavaScript version control disrupted
- Image loading failures across faculty/staff profiles
- Search functionality temporarily impaired

## Lessons Learned

### What Went Well

1. **Quick Recognition**: Web team rapidly identified this as a platform-wide issue rather than isolated problems
2. **Proper Escalation**: Appropriate escalation to T4 infrastructure support when code-level solutions proved ineffective  
3. **Systematic Troubleshooting**: Methodical approach from application-level to infrastructure-level diagnosis
4. **Effective Communication**: Clear communication with support team leading to rapid resolution

### Improvement Opportunities

1. **Infrastructure Change Notifications**: Request advance notification of infrastructure changes that could impact web services
2. **Monitoring Enhancement**: Implement monitoring for third-party infrastructure changes
3. **Incident Communication**: Develop process for rapid communication during website outages

## Preventive Measures

### Immediate Actions

- [x] Issue resolved by T4 infrastructure provider
- [x] All systems verified operational
- [x] Incident documented for future reference

### Future Considerations

1. **Infrastructure Coordination**: Establish communication channel with T4 Engineering for planned changes
2. **Monitoring Enhancement**: Implement alerts for widespread asset loading failures
3. **Incident Response**: Document infrastructure-related troubleshooting procedures

## Resolution Confirmation

All systems have been verified as fully operational:

- ✅ Main university website (seattleu.edu)
- ✅ Law website (law.seattleu.edu)
- ✅ Search applications (production and development)
- ✅ Faculty/staff profile images
- ✅ CSS and JavaScript asset delivery
- ✅ All development environments

## Supporting Information

### Technical Contacts

- **Internal**: Seattle University Web Team
- **External**: T4 Engineering Support

### Reference Materials

- T4 Support Ticket: P1 Priority CS-109205, CS-109336
- Deployment Timestamps: Vercel deployment logs
- Infrastructure Change: AWS media caching configuration

---

**Report Status**: Final  
**Next Review**: None required unless similar incidents occur  
**Distribution**: Seattle University Leadership, Web Team Records
