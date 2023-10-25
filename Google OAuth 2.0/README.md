Access Token: ya29.a0AfB_byDFmUVXsL8q1KuADg8YqKNdo0S1-6F_bf7JpcigMN1sZahbiGhUHzoriQybsAVgtjsWrd3Nry2L21uX67ynxoQHPhoE_RAg5oGBEJUNI_oUk6tYHa5TGGqpzLH4AxF9gy5uM-SrFjWaene0kT3ceIt2Ifq7OKJAaCgYKAfsSARISFQGOcNnCKyJlxKF9YrFaP5CFV-zPIQ0171
Refresh Token: 1//0guDw48-FX_vkCgYIARAAGBASNwF-L9Ir1xcXRLMJlX5QVrf8_ha9AkT_GHMG-2ywfe5c9TUQnicUTziI9b2ZXqHwlWj0LiwCluQ

# GOOGLE OAuth 2.0 flow

OAuth 2.0 (Open Authorization 2.0) is an industry-standard protocol for authorization. It allows applications to securely access a user's data without exposing the user's credentials. Google OAuth 2.0 is an implementation of the OAuth 2.0 protocol by Google and is commonly used for allowing third-party applications to access Google services on behalf of a user. Here's a detailed explanation of Google OAuth 2.0:

Key Components of Google OAuth 2.0:
User: The person who owns a Google account and is granting authorization to a third-party application.

Third-Party Application: The application that wants to access the user's data on Google services, such as Google Drive, Google Calendar, or Gmail.

Google OAuth 2.0: The service provided by Google that facilitates the authorization process.

Authorization Flow:
Google OAuth 2.0 typically follows the authorization code flow, which is a secure and recommended way to handle authorization.

User Initiates Authorization:

The user interacts with the third-party application and requests access to their Google account.
Third-Party Application Redirects to Google:

The third-party application redirects the user to Google's authorization server with specific parameters, including the requested scopes (permissions), client ID, and redirect URI.
User Consents:

The user is presented with the Google OAuth consent screen, which explains what permissions the application is requesting. The user must grant or deny access.
Google Generates an Authorization Code:

If the user consents, Google generates an authorization code and redirects the user back to the redirect URI provided by the third-party application.
Third-Party Application Exchanges Authorization Code for Tokens:

The third-party application sends the authorization code to Google's token endpoint and requests access and refresh tokens.
Google Returns Tokens:

If the authorization code is valid and the user has granted consent, Google's token endpoint returns an access token, a refresh token, and possibly other information to the third-party application.
Third-Party Application Stores Tokens:

The third-party application securely stores the received tokens, especially the refresh token, for future use.
Token Usage:
Access Token: This token is used to access Google services on behalf of the user. It is short-lived, typically valid for one hour.

Refresh Token: The refresh token is used to obtain new access tokens when the current one expires. It is long-lived and should be stored securely.

Token Refresh:
To maintain access to the user's Google account, the application uses the access token for API requests. When the access token expires, it uses the refresh token to obtain a new access token without the user's involvement.

Revocation:
Users can revoke the access they've granted to a third-party application through their Google Account settings.
Use Cases:
Google OAuth 2.0 is used by third-party applications to access Google services, such as Google Drive, Gmail, Google Calendar, and YouTube, on behalf of users.

It's commonly used for integrating Google services into applications, managing user data, and automating tasks.

Security Considerations:
Protecting the client secret and tokens is crucial to maintaining security.

Regularly audit and monitor access to sensitive user data.

Follow best practices to secure tokens, user data, and your application.

Google OAuth 2.0 is a widely adopted and secure way to allow third-party applications to access a user's Google services while maintaining user privacy and data security.

# JWT flow

JWT tokens combines of

1. Header
2. Payload
3. Signature

Header - It consist of type of token and the algorithym used
Payload - It consist of the claims. Claims are statements about an entity (typically, the user) and additional metadata
Signature - To create a signaturn part you have to take the encoded header, encoded payload and secret and the algorithym specified in the header

In authentication, when the user successfully logs in using their credentials, a JSON Web Token will be returned. Since tokens are credentials, great care must be taken to prevent security issues. In general, you should not keep tokens longer than required.

Here's how this works in a typical authentication flow:

User Authentication: When a user logs into an application, the server generates a JWT access token. This token contains information about the user's identity, permissions, and an expiration time.

Access Token: The JWT access token is sent to the client (usually a web browser or a mobile app). The client includes this token in the headers of its requests to protected resources on the server.

Refresh Token: In some authentication systems, a refresh token is also generated at the time of login or token issuance. The refresh token is typically a longer-lived token, and its main purpose is to obtain a new access token without requiring the user to log in again. The refresh token is not included in the request headers for API calls.

Access Token Expiration: The access token has a short expiration time (e.g., 15 minutes). When it expires, the client needs to request a new access token.

Token Renewal: To renew the access token, the client sends the refresh token to the server. The server validates the refresh token and, if it's valid, issues a new access token. This allows the user to stay logged in without re-entering their credentials.

Repeat: This process can be repeated until the refresh token expires or is invalidated, at which point the user would need to log in again.

Since access tokens aren’t valid for an extended period because of security reasons, a refresh token helps to re-authenticate a user without login credentials. This Refresh token is never exposed to the client-side Javascript, even if our access token gets compromised it’ll be expired in a very short duration. So, we will be sending two tokens instead of one, an access token and a refresh token. The access token will contain all the user information and will be stored in Javascript runtime, but the refresh token will be stored securely in an HTTP-only cookie.
