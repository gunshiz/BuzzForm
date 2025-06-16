const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('artifact')
    .setDescription('เสือกไอดีแฟลกชาวบ้าน')
    .addStringOption(option =>
      option.setName('name').setDescription('ชื่อของคุณ').setRequired(true))
    .addStringOption(option =>
      option.setName('uid').setDescription('UID ของคุณ').setRequired(true))
    .addStringOption(option =>
      option.setName('character').setDescription('ตัวละครที่ต้องการจะดู').setRequired(true))
    .addStringOption(option =>
      option.setName('message').setDescription('ข้อความเพิ่มเติม').setRequired(false)),

  async execute(interaction) {
    const name = interaction.options.getString('name');
    const uid = interaction.options.getString('uid');
    const character = interaction.options.getString('character');
    const message = interaction.options.getString('message') || '';

    try {
      if (await axios.post('http://localhost:3000/api/submit',
        { name, uid, character, message },
        { headers: { 'x-bot-token': config.botTokenSecret } }
      ).then(e => `${e.status}`[0] !== '2')) {
        throw new Error('Server did not respond with success');
      }

      await interaction.reply({ content: '✅ ส่งข้อมูลไปเรียยร้อย!', ephemeral: true });
    } catch (error) {
      await interaction.reply({content: `❌ ส่งข้อมูลไม่สำเร็จ โปรดลองอีกครั้งภายหลัง\n-# ${error.response?.data?.error || error.message}`, ephemeral: true });
    }
  }
};
