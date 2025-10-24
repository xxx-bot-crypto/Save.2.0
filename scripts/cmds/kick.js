 module.exports = {
    config: {
        name: "kick",
        aliases: ["kik"],
        version: "3.6",
        author: "nx ",
        countDown: 5,
        role: 1,
        description: {
            vi: "Kick thành viên khỏi box chat",
            en: "Kick member out of chat box"
        },
        category: "box chat",
        guide: {
            vi: "{pn} @tags: dùng để kick những người được tag",
            en: "{pn} @tags: use to kick members who are tagged"
        }
    },

    langs: {
        vi: {
            needAdmin: "Vui lòng thêm quản trị viên cho bot trước khi sử dụng tính năng này",
            kickSuccess: "Đã kick thành công 🎉",
            kickFail: "Không thể kick thành viên này 😅",
            syntaxError: "⚠️ Sai cú pháp! Tag người hoặc reply tin nhắn để kick."
        },
        en: {
            needAdmin: "Please make the bot an admin first to use this feature 😎",
            kickSuccess: "Kicked successfully! 🚀",
            kickFail: "Oops! Couldn't kick this member 🤣",
            syntaxError: "⚠️ Wrong command syntax! Tag users or reply to kick.",
            funnyDialogues: "ওহ হ্যাঁ… তোমার গ্রুপ টাইম শেষ! 😏\nAlert! তুমি আউট হতে যাচ্ছো! 🏃‍♂️😜\nWarning! কিক coming… dodge করতে পারলে dodge করো! 😂",
            warningMsg: "⚠️ {name},ভালো থাকিস , আবার কোনোদিন দেখা হবে !\nতোর কাছে 10 সেকেন্ড সময় আছে... ⏳"
        }
    },

    onStart: async function ({ message, event, api, getLang }) {
        try {
            // Check if bot is admin
            const threadInfo = await api.getThreadInfo(event.threadID);
            if (!threadInfo.adminIDs.some(admin => admin.id == api.getCurrentUserID())) {
                return message.reply(getLang("needAdmin"));
            }

            // Collect user IDs
            let uids = [];
            if (event.messageReply) uids.push(event.messageReply.senderID);
            if (event.mentions) uids.push(...Object.keys(event.mentions));
            if (uids.length === 0) return message.reply(getLang("syntaxError"));

            uids = [...new Set(uids)];
            const dialogues = getLang("funnyDialogues").split("\n");
            let resultMsg = "💥 𝐊𝐢𝐜𝐤 𝐑𝐞𝐬𝐮𝐥𝐭𝐬 💥\n━━━━━━━━━━━━━━━\n";

            for (const uid of uids) {
                if (uid == api.getCurrentUserID()) {
                    resultMsg += `🤖 আমি নিজেকে কিক করতে পারি না!\n`;
                    continue;
                }

                try {
                    const userInfo = await api.getUserInfo(uid);
                    const name = userInfo[uid]?.name || "Unknown User";

                    // Send 10-second warning
                    const warningText = getLang("warningMsg").replace("{name}", name);
                    await message.reply({
                        body: warningText,
                        mentions: [{ tag: name, id: uid }]
                    });

                    // Wait 10 seconds
                    await new Promise(res => setTimeout(res, 10000));

                    // Kick the user
                    await api.removeUserFromGroup(uid, event.threadID);

                    const randomText = dialogues[Math.floor(Math.random() * dialogues.length)];
                    resultMsg += `✅ ${name} — ${getLang("kickSuccess")}\n${randomText}\n\n`;
                } catch (error) {
                    const userInfo = await api.getUserInfo(uid).catch(() => ({}));
                    const name = userInfo[uid]?.name || "Unknown User";
                    resultMsg += `❌ ${name} — ${getLang("kickFail")}\n`;
                }
            }

            resultMsg += "━━━━━━━━━━━━━━━\n🎯 সব কাজ শেষ!";
            await message.reply(resultMsg);

        } catch (err) {
            console.error(err);
            message.reply("❌ কিছু ভুল হয়েছে! অনুগ্রহ করে আবার চেষ্টা করো।");
        }
    }
};
