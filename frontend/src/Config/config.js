const test=true;

const config={
 BACKEND_URL:test?"https://localhost:3000":"https://192.168.2.250:3000",
 API_URL:test?"http://localhost:3000/":"https://192.168.2.250:3000/",
 TWILIO_ACCOUNT_SID:"AC000000",
 RECOVERY_CODE:"QV8TQPA5Y4FUQYL6WA5LVFU4",
 TWILIO_SID:"your_twilio_sid",
 TWILIO_AUTH_TOKEN:"your_twilio_token",
 TWILIO_PHONE:"+1234567890",
 SENDGRID_API_KEY:"your_sendgrid_key",
 SENDGRID_EMAIL:"verified@email.com"
};

export default config;