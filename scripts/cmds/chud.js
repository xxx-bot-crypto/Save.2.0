const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "poke",
    aliases: ["chud"],
    version: "2.9",
    author: "xalman",
    countDown: 400,
    role: 0,
    shortDescription: "Poke with custom image",
    longDescription: "Generate a poke image with the mentioned user using a custom background.",
    category: "18+",
    guide: "{pn} @mention"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions);
    if (mention.length === 0)
      return message.reply("Please mention someone to poke.");

    const senderID = event.senderID;
    const mentionedID = mention[0];

    try {
      // Avatar URLs
      const avatarSender =
        (await usersData.getAvatarUrl(senderID)) ||
        `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;
      const avatarMentioned =
        (await usersData.getAvatarUrl(mentionedID)) ||
        `https://graph.facebook.com/${mentionedID}/picture?width=512&height=512`;

      // Load images
      const [avatarImgSender, avatarImgMentioned, bg] = await Promise.all([
        Canvas.loadImage(avatarSender),
        Canvas.loadImage(avatarMentioned),
        Canvas.loadImage(
          "https://i.postimg.cc/90M4j2yZ/20251102-155328.png" // ✅ background
        )
      ]);

      // Canvas setup (portrait)
      const canvasWidth = 873;
      const canvasHeight = 1280;
      const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);

      // Avatar size and position (top corners)
      const avatarSize = Math.floor(canvasWidth * 0.28);
      const avatarY = 80;

      // 🟢 Left (now sender)
      const leftX = 80;
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        leftX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImgSender, leftX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // 🔵 Right (now mentioned user)
      const rightX = canvasWidth - avatarSize - 80;
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        rightX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImgMentioned, rightX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Save image
      const imgPath = path.join(
        __dirname,
        "tmp",
        `${senderID}_${mentionedID}_poke.png`
      );
      await fs.ensureDir(path.dirname(imgPath));
      fs.writeFileSync(imgPath, canvas.toBuffer("image/png"));

      // Send message
      message.reply(
        {
          body: "chudling pong 🫦",
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlinkSync(imgPath)
      );
    } catch (err) {
      console.error("❌ Error in poke command:", err);
      message.reply(`❌ Error creating poke image:\n${err.stack || err.message}`);
    }
  }
};
