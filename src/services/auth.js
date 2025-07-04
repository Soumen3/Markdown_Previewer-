import { account, ID } from '../lib/appwrite'

/**
 * Authentication service for handling user registration, login, and session management
 */
export class AuthService {
  
  /**
   * Register a new user account
   * @param {Object} userData - User registration data
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {string} userData.email - User's email address
   * @param {string} userData.password - User's password
   * @param {string} userData.company - User's company (optional)
   * @param {boolean} userData.subscribeNewsletter - Newsletter subscription preference
   * @returns {Promise<Object>} User object and session
   */
  
  async register(userData) {
    try {
      const fullName = `${userData.firstName} ${userData.lastName}`.trim()
      
      // Create user account
      const user = await account.create(
        ID.unique(),
        userData.email,
        userData.password,
        fullName
      )
      
      // Automatically log in the user after registration
      const session = await account.createEmailPasswordSession(
        userData.email,
        userData.password
      )
      
      // Send email verification
      try {
        const verificationUrl = `${window.location.origin}/verify-email`
        await account.createVerification(verificationUrl)
      } catch (verificationError) {
        // Don't fail registration if verification email fails
        console.warn('Failed to send verification email:', verificationError)
      }
      
      // TODO: Store additional user preferences in database
      // - Company information
      // - Newsletter subscription preference
      // - Terms agreement timestamp
      
      return { user, session }
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  async login(email, password) {
    try {
      // Create email password session
      const session = await account.createEmailPasswordSession(email, password)
      
      // Get current user data
      const user = await account.get()
      
      return { session, user }
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }


  async loginWithGoogle(successUrl, failureUrl) {
    try {
      await account.createOAuth2Session('google', successUrl, failureUrl)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  async loginWithGitHub(successUrl, failureUrl) {
    try {
      await account.createOAuth2Session('github', successUrl, failureUrl)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }


  async getCurrentUser() {
    try {
      return await account.get()
    } catch (error) {
      // User is not logged in
      return null
    }
  }


  async getCurrentSession() {
    try {
      return await account.getSession('current')
    } catch (error) {
      // No active session
      return null
    }
  }


  async logout() {
    try {
      await account.deleteSession('current')
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  async logoutAll() {
    try {
      await account.deleteSessions()
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  async forgotPassword(email, url) {
    try {
      await account.createRecovery(email, url)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  async resetPassword(userId, secret, newPassword) {
    try {
      await account.updateRecovery(userId, secret, newPassword)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }


  async updatePassword(newPassword, oldPassword) {
    try {
      return await account.updatePassword(newPassword, oldPassword)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }


  async updateEmail(email, password) {
    try {
      return await account.updateEmail(email, password)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  async updateName(name) {
    try {
      return await account.updateName(name)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  async updateProfile(userData) {
    try {
      const updates = []
      
      // Update name if provided
      if (userData.name) {
        updates.push(account.updateName(userData.name))
      }
      
      // Update email if provided
      if (userData.email) {
        updates.push(account.updateEmail(userData.email, userData.password || ''))
      }
      
      // Execute all updates
      await Promise.all(updates)
      
      // Return updated user data
      return await account.get()
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Send email verification to the currently logged in user
   * @param {string} url - Verification URL that user will be redirected to after clicking the verification link
   * @returns {Promise<void>}
   */
  async sendEmailVerification(url) {
    try {
      await account.createVerification(url)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Complete email verification process
   * @param {string} userId - User ID from verification link
   * @param {string} secret - Secret token from verification link
   * @returns {Promise<void>}
   */
  async verifyEmail(userId, secret) {
    try {
      await account.updateVerification(userId, secret)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  /**
   * Check if current user's email is verified
   * @returns {Promise<boolean>}
   */
  async isEmailVerified() {
    try {
      const user = await account.get()
      return user.emailVerification
    } catch (error) {
      return false
    }
  }

  async deleteAccount() {
    try {
      // Delete the current user account
      await account.delete()
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }


  handleAuthError(error) {
    let message = 'An unexpected error occurred. Please try again.'
    
    switch (error.code) {
      case 400:
        message = 'Invalid input. Please check your information and try again.'
        break
      case 401:
        message = 'Invalid credentials. Please check your email and password.'
        break
      case 409:
        message = 'An account with this email already exists.'
        break
      case 429:
        message = 'Too many requests. Please wait a moment and try again.'
        break
      case 501:
        message = 'This authentication method is not available.'
        break
      default:
        if (error.message) {
          message = error.message
        }
    }
    
    const formattedError = new Error(message)
    formattedError.code = error.code
    formattedError.type = error.type
    return formattedError
  }


  async isAuthenticated() {
    try {
      await account.get()
      return true
    } catch (error) {
      return false
    }
  }
}

// Export a singleton instance
export const authService = new AuthService()
export default authService
