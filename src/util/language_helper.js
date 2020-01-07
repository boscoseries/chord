module.exports = {
  OTP_EMAIL_SUBJECT: 'mAudition Token',
  OTP_HTML_EMAIL:
    '<div class="email-title">You are almost there</div>'
    + '<div class="email-body"><p>Thanks so much for joining mAudition. To finish signing up, you just need to confirm that we got your email right. Please use the code to confirm your email.</p><p class="otp-class">{otp}</p><p>If you didn\'t try to log in, you can ignore this email</p></div>',
  OTP_TEXT_EMAIL:
    "Please verify your email /n Thanks so much for joining mAudition. To finish signing up, you just need to confirm that we got your email right. Please use the code to confirm your email./n {otp} /n If you didn't try to log in, you can ignore this email /n",
  OTP_SMS_TEXT: "{otp} /n If you didn't try to log in, you can ignore this email",
  COMPETITION_NOTIF: 'A new competition, {competition_name} has been created on mAudition',
  JOINED_COMPETITION: {
    SUBJECT: 'I Joined mAudition',
    HTML:
      '<div class="email-title">Help me win on mAudition!</div>'
      + '<div class="email-body"><p>I have joined {competition} competition on mAudition. It starts on {date}. Please download mAudition app before then to help me win.</p><p>click http://bit.ly/2stPqJC to download the mAudition app.</p></div>',
    PLAIN:
      'Help me win on mAudition! /n I have joined {competition} competition on mAudition. It starts on {date}. Please download mAudition app before then to help me win./n click http://bit.ly/2stPqJC to download the mAudition app. /n',
    SMS: 'I have joined {competition} competition on mAudition. It starts on {date}. Please download mAudition app before then to help me win. click http://bit.ly/2stPqJC to download the mAudition app.',
  },
  STARTED_COMPETITION: {
    SUBJECT: 'Competition has started',
    HTML:
      `<div class="email-title">Help me win on mAudition!</div>
      <div class="email-body"><p>My entry into {competition} competition on mAudition is now available. Please view and share with your friends to help me win. http://www.maudition.com/posts/{id}</p></div>`,
    PLAIN: `My entry into {competition} competition on mAudition is now available. 
    Please view and share with your friends to help me win. http://www.maudition.com/posts/{id}/n`,
    SMS: `My entry into {competition} competition on mAudition is now available. 
    Please view and share with your friends to help me win. http://www.maudition.com/posts/{id}`,
  },
};
