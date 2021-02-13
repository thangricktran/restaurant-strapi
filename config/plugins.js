module.exports = ({ env }) => ({
  email: {
    provider: 'sendgrid',
    providerOptions: {
      apiKey: env('SENDGRID_API_KEY'),
    },
    settings: {
      defaultFrom: "thangricktran@att.net",
      defaultReplyTo: "thangricktran2@gmail.com",
    }
  }
});