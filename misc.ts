const markArchivedAsRead = () => {
    const threads = GmailApp.search("label:unread -label:inbox");
    GmailApp.markThreadsRead(threads);
};
