bot.action("action", (ctx) => {
    // User who triggered the action
    console.log("User:", ctx.from);
    
    // Message object of the action
    console.log("Message:", ctx.message);
    
    // Callback query data
    console.log("Callback Query Data:", ctx.callbackQuery.data);
    
    // Chat ID
    console.log("Chat ID:", ctx.chat.id);
    
    // Sender's ID
    console.log("Sender ID:", ctx.from.id);
    
    // Sender's username
    console.log("Username:", ctx.from.username);
    
    // Sender's first name
    console.log("First Name:", ctx.from.first_name);
    
    // Sender's last name
    console.log("Last Name:", ctx.from.last_name);
    
    // Inline message ID (if available)
    console.log("Inline Message ID:", ctx.inlineMessageId);
    
    // Message ID of the original message (if available)
    console.log("Original Message ID:", ctx.message.message_id);
    
    // Text of the original message (if available)
    console.log("Original Message Text:", ctx.message.text);
});
