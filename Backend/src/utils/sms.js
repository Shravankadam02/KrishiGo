export const sendTransactionalSMS = async (phone, templateId, vars) => {
  // TODO: Implement actual MSG91 API call here
  console.log(`[SMS] To: ${phone} | Template: ${templateId} | Variables:`, vars)
  return true
}
