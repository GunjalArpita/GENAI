const { generateResumePdf } = require('../src/services/ai.service');
(async () => {
  try {
    const buffer = await generateResumePdf({ resume: 'Sample resume', selfDescription: 'I am a developer', jobDescription: 'Frontend developer' });
    console.log('PDF buffer length:', buffer.length);
  } catch (e) {
    console.error('Error:', e);
  }
})();
