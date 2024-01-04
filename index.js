// Importing all the modules for the project
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
// Loading the Google API credentials from googleConfigfile
const credentials = require('./googleConfig.json');
// extracting OAuth2 client details from credentials which is been fetched from google developer console
const { client_secret, client_id, redirect_uris } = credentials.installed;
// setting up the OAuth2 client with the extracted details
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
// Setting the credentials for the OAuth2 client which are been extracted from token.json
oAuth2Client.setCredentials({
  "access_token": "ya29.a0AfB_byCSzuV7Tlq00k-upruIPUEph02zHH0RiFjXrGrifJyQ7yNQp153h83yXRbCFHxgE_wMWepaB2jpTC7pxn7oi2Fl9Fr83Whi4UIscFPuCtHoZIfel8YoIR49tD_u4BnkK8SK0IunwmDjAS9xPxTx9VyvXrJxxNPAaCgYKAU8SARISFQHGX2Midx9DDzUOJzZK4KS0S-_kSw0171",
  "refresh_token": "1//0gc5C3WJlNWWsCgYIARAAGBASNwF-L9IrleTxe4shi38Ee_dweIpkvTP45dhyCIpjveXjVvSkr71fkjFzKkbbsxRc44Tk3jcZq7c",
  "scope": "https://www.googleapis.com/auth/gmail.modify",
  "token_type": "Bearer",
  "expiry_date": 1704310148033
});
// Creating  a Gmail service instance with the authorized client
const gmailService = google.gmail({ version: 'v1', auth: oAuth2Client });
// Function to fetch inbox messages from a gmail
async function fetchInboxMessages() {
  const response = await gmailService.users.messages.list({
    userId: 'me',      // Specifies the user
    labelIds: ['INBOX'] // Filters to only get messages from the inbox
  });
  const messages = response.data.messages || [];
  return messages;
}
// Function to send an automated reply
async function sendAutoReply(messageId, threadId) {
  // email subject
  const replySubject = "Out of Office";
  const replyMessage = "I am currently on vacation and will get back to you as soon as possible.";
  // Constructing the raw email
  const emailContent = `Content-Type: text/plain; charset="UTF-8"\nMIME-Version: 1.0\nContent-Transfer-Encoding: 7bit\nTo: recipient@example.com\nFrom: your-email@example.com\nSubject: ${replySubject}\n\n${replyMessage}`;
  // encoding it in base64 format
  const encodedEmail = Buffer.from(emailContent).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  // Send the email using Gmail API which we had enabled from the google developer console
  await gmailService.users.messages.send({
    userId: 'me',       
    requestBody: {
      raw: encodedEmail, 
      threadId: threadId
    },
  });
  // Logging the action to the console
  console.log('Automated reply sent for:', messageId);
}
// Function to check inbox messages and process replies
async function monitorInboxAndRespond() {
  // Fetching messages from the inbox
  const inboxMessages = await fetchInboxMessages();
  for (const message of inboxMessages) {
    // Check if the message is in the inbox
    const labels = message.labelIds || [];
    if (!labels.includes('INBOX')) {
      // If not in the inbox, send an automated reply
      await sendAutoReply(message.id, message.threadId);
    }  }
}
// Set an interval to periodically check the inbox and send replies
setInterval(monitorInboxAndRespond, Math.floor(Math.random() * (120000 - 45000 + 1)) + 45000);
