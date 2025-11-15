exports.handler = async (event) => {
    console.log("Pre Sign-up trigger received event:", JSON.stringify(event, null, 2));
    
    // Initialize response object if it doesn't exist
    if (!event.response) {
        event.response = {};
    }
    
    // Automatically confirm all users
    event.response.autoConfirmUser = true;
    
    // Auto-verify email if present
    if (event.request && event.request.userAttributes && event.request.userAttributes.email) {
        event.response.autoVerifyEmail = true;
    }
    
    // Auto-verify phone if present  
    if (event.request && event.request.userAttributes && event.request.userAttributes.phone_number) {
        event.response.autoVerifyPhone = true;
    }
    
    console.log("Pre Sign-up response:", JSON.stringify(event.response, null, 2));
    return event;
};