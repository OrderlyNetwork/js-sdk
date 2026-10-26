export const notification = {
  "notification.source.orderly": "Orderly",
  "notification.source.platform": "Platform",
  "notification.source.label": "Source: {{name}}",
  // Announcement related keys
  "notification.campaign": "Campaign announcement",
  "notification.delisting": "Token delisting",
  "notification.general": "General update",
  "notification.joinNow": "Join now",
  "notification.listing": "New token listing",
  "notification.vote": "Community vote",
  "notification.maintenance": "System maintenance",
  "notification.maintenanceDuration.hours":
    "{{hours}} HRs at {{startTimeFormatted}} - {{endTimeFormatted}} (UTC)",
  "notification.maintenanceDuration.minutes":
    "{{minutes}} MINs at {{startTimeFormatted}} - {{endTimeFormatted}} (UTC)",
  "notification.recentlyUpdated": "Recently updated",
  "notification.title": "Announcement",
  "notification.centerTitle": "Announcement center",

  // Notification related keys
  "notification.closeAll": "Close all ({{total}})",
  "notification.delistingTitle": "Token Delisting Notice",
  "notification.generalTitle": "General Update",
  "notification.maintenanceTitle": "System Maintenance",
  "notification.empty": "No announcements",
  "notification.announcements": "Announcements",
  "notification.category.campaign": "Campaign",
  "notification.category.listing": "Listings",
  "notification.category.delisting": "Delistings",
  "notification.category.update": "Updates",
  "notification.category.legal": "Legal",
  "notification.category.others": "Others",
  "notification.publishedOn": "Published on",
  "notification.viewAll": "View all",
  "notification.article": "Article",
  "notification.notFound": "Announcement not found",
  "notification.notFoundDescription":
    "This announcement is unavailable. Browse the announcement list to find another update.",
  "notification.previous": "Previous announcement",
  "notification.next": "Next announcement",
  "notification.expand": "Expand announcement",
  "notification.collapse": "Collapse announcement",
  "notification.loading": "Loading announcements",
  "notification.loadFailed":
    "Announcements could not be loaded. Please try again.",
  "notification.retry": "Retry",
  "notification.pagination": "Announcement pages",
  "notification.newAnnouncements": "New announcements",
};

export type Notification = typeof notification;
