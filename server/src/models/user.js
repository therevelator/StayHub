import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

class User {
  static async create({ email, password, firstName, lastName, phoneNumber }) {
    try {
      console.log('Creating user with data:', { email, firstName, lastName, phoneNumber });
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      
      const result = await db.query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, phone_number)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, email, hashedPassword, firstName, lastName, phoneNumber]
      );
      
      const user = await this.findById(userId);
      console.log('User created successfully:', user);
      return user;
    } catch (error) {
      console.error('Error in User.create:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      console.log('Finding user by email:', email);
      const users = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      console.log('Find by email result:', users[0]);
      return users[0];
    } catch (error) {
      console.error('Error in User.findByEmail:', error);
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      console.log('Finding user by id:', id);
      const users = await db.query(
        'SELECT id, email, first_name, last_name, phone_number, created_at, email_verified FROM users WHERE id = ?',
        [id]
      );
      console.log('Find by id result:', users[0]);
      return users[0];
    } catch (error) {
      console.error('Error in User.findById:', error);
      throw new Error(`Failed to find user by id: ${error.message}`);
    }
  }

  static async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error in User.verifyPassword:', error);
      throw new Error('Failed to verify password');
    }
  }

  static async updateLastLogin(userId) {
    try {
      await db.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
    } catch (error) {
      console.error('Error in User.updateLastLogin:', error);
      throw new Error('Failed to update last login');
    }
  }

  static async createProfile(userId, profileData = {}) {
    try {
      console.log('Creating profile for user:', userId);
      const result = await db.query(
        `INSERT INTO user_profiles (user_id, preferred_language, preferred_currency, notification_preferences)
         VALUES (?, ?, ?, ?)`,
        [
          userId,
          profileData.language || 'en',
          profileData.currency || 'USD',
          JSON.stringify(profileData.notifications || { email: true, push: false })
        ]
      );
      console.log('Profile created successfully');
      return result;
    } catch (error) {
      console.error('Error in User.createProfile:', error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }
  }

  static async createSecuritySettings(userId) {
    try {
      console.log('Creating security settings for user:', userId);
      const result = await db.query(
        `INSERT INTO user_security (user_id)
         VALUES (?)`,
        [userId]
      );
      console.log('Security settings created successfully');
      return result;
    } catch (error) {
      console.error('Error in User.createSecuritySettings:', error);
      throw new Error(`Failed to create security settings: ${error.message}`);
    }
  }
}

export default User;
