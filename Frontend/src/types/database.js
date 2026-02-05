/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} email
 * @property {string} full_name
 * @property {'user' | 'admin'} role
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Resource
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} category
 * @property {number} quantity_available
 * @property {string | null} created_by
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Request
 * @property {string} id
 * @property {string} user_id
 * @property {string} resource_id
 * @property {number} quantity_requested
 * @property {string} purpose
 * @property {'pending' | 'approved' | 'rejected'} status
 * @property {string | null} rejection_reason
 * @property {string | null} reviewed_by
 * @property {string | null} reviewed_at
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Request & {
 *   resource?: Resource,
 *   user?: Profile,
 *   reviewer?: Profile
 * }} RequestWithDetails
 */

export {};
