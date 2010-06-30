# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_claims_session',
  :secret      => '262c5bceabd2d467b8b30e6cc06c9fc53a5903bdf37bdae93fce8dc3705e855724c47f4572e2c4958a57311c68c9ebdf50fbeb12f1268cc860f5354297dba58c'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
