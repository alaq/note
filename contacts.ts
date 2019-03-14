const getContactGroups = () => {
    const contactGroups = ContactsApp.getContactGroups();
    for (let i = 0; i < contactGroups.length; i++) {
        Logger.log(
            contactGroups[i].getId() +
                " " +
                contactGroups[i].getName() +
                " " +
                contactGroups[i].getContacts().length
        );
    }
};

const getContactsString = () => {
    let mostRecent;
    let contactsString = "";
    const contacts = ContactsApp.getContactGroupById(
        "http://www.google.com/m8/feeds/groups/adrien%40alaq.io/base/6"
    ).getContacts();
    for (let i = 0; i < contacts.length; i++) {
        if (mostRecent < contacts[i].getLastUpdated() || !mostRecent)
            mostRecent = contacts[i].getLastUpdated();
        const tagName =
            "@" +
            contacts[i].getGivenName().replace(/[^\w]/gi, "") +
            contacts[i].getFamilyName().replace(/[^\w]/gi, "");
        const emails =
            contacts[i].getEmails().length &&
            contacts[i].getEmails().map(function(email) {
                return email.getAddress();
            });
        let properties = "";

        if (emails) {
            emails.forEach(function(email) {
                properties += ":Email: " + email + "\n";
            });
        }

        contactsString +=
            "* " +
            tagName +
            " :" +
            tagName +
            ": \n:PROPERTIES:\n" +
            properties +
            ":END:\n";
    }
    Logger.log("last update: " + mostRecent);
    Logger.log("contacts:\n" + contactsString);
    return { string: contactsString, mostRecent: mostRecent, };
};

function uploadToDropbox() {
    const parameters = {
        path: "/org/humans.org",
        mode: {
            ".tag": "overwrite",
        },
        autorename: false,
        mute: false,
        strict_conflict: false,
    };

    // Add Dropbox Access Token
    const dropboxAccessToken = "REPLACE_WITH_DB_ACCESS_TOKEN";

    const headers = {
        "Content-Type": "application/octet-stream",
        Authorization: "Bearer " + dropboxAccessToken,
        "Dropbox-API-Arg": JSON.stringify(parameters),
    };

    const contacts = getContactsString();
    const file = contacts.string;

    const options = {
        method: "POST",
        headers: headers,
        payload: file,
    };

    const apiUrl = "https://content.dropboxapi.com/2/files/upload";

    const date = new Date();
    date.setHours(date.getHours() - 1);

    Logger.log("most recent edit: " + contacts.mostRecent);

    if (contacts.mostRecent >= date) {
        const response = JSON.parse(
            UrlFetchApp.fetch(apiUrl, options).getContentText()
        );
        Logger.log("File uploaded successfully to Dropbox");
    } else {
        Logger.log("no update to contacts, nothing to do");
    }
}
