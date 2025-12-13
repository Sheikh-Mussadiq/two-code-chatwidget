# Integration Guide

This guide provides instructions on how to integrate the TwoCode Chat Widget into your website.

## Quick Start

The easiest way to add the widget is by including the UMD bundle directly in your HTML.

### 1. Add the Script

Add the following script tag before the closing `</body>` tag of your website:

```html
<script src="https://your-domain.com/two-code-chat-widget.umd.js"></script>
```

> **Note:** Replace `https://your-domain.com` with the actual URL where you are hosting the `two-code-chat-widget.umd.js` file.

### 2. Initialize the Widget

Initialize the widget with your desired configuration:

```html
<script>
  TwoCodeChatWidget.init({
    title: "Chat Support",
    subtitle: "We typically reply within minutes",
    welcomeMessage: "Hello! 👋 How can I help you today?",
    placeholder: "Type your message...",
    formTitle: "Start a conversation",
    formSubtitle: "Please enter your details to begin chatting with us.",
  });
</script>
```

## Configuration Options

You can customize the widget by passing an options object to the `init` method.

| Option           | Type     | Default                                 | Description                                                                  |
| :--------------- | :------- | :-------------------------------------- | :--------------------------------------------------------------------------- |
| `title`          | `string` | `"Chat Support"`                        | The main title displayed in the widget header.                               |
| `subtitle`       | `string` | `"We typically reply within minutes"`   | Subtitle text below the main title.                                          |
| `welcomeMessage` | `string` | `"Hello! 👋 How can I help you today?"` | Initial message from the bot when chat starts.                               |
| `placeholder`    | `string` | `"Type your message..."`                | Placeholder text for the message input.                                      |
| `formTitle`      | `string` | `"Start a conversation"`                | Title for the pre-chat form.                                                 |
| `formSubtitle`   | `string` | `"Please enter your details..."`        | Subtitle for the form. Also shown in closed state if no chat history exists. |
| `primaryColor`   | `string` | -                                       | (Coming Soon) Custom primary color for the widget.                           |

## Hosting the Widget

To host the widget yourself:

1. Build the project using `npm run build:widget`.
2. Locate the `dist-widget/two-code-chat-widget.umd.js` file.
3. Upload this file to your web server, CDN, or static file host (e.g., S3, Netlify, Vercel).
4. Use the public URL of the uploaded file in the `<script src="...">` tag.
