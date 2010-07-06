# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20100706170253) do

  create_table "action_types", :force => true do |t|
    t.string "action_name"
  end

  create_table "claims", :id => false, :force => true do |t|
    t.integer  "id",                                                              :null => false
    t.integer  "patient_id"
    t.string   "printed",             :limit => 15
    t.string   "paid",                :limit => 15
    t.decimal  "total_charge",                      :precision => 9, :scale => 2
    t.decimal  "amount_paid",                       :precision => 9, :scale => 2
    t.decimal  "balance_due",                       :precision => 9, :scale => 2
    t.datetime "dtmExported"
    t.datetime "dtmPrinted"
    t.datetime "first_claim_date"
    t.datetime "dtmBillDate"
    t.text     "claim_note"
    t.datetime "dtmPaidDate"
    t.datetime "dtmDateOfCurrent"
    t.datetime "dtmFollowUp"
    t.string   "OriginalRefNo",       :limit => 50
    t.datetime "AdmittedDateClaim"
    t.datetime "DischargedDateClaim"
    t.datetime "dtmRecurUntil"
    t.datetime "dtmOtherClaimDate"
    t.datetime "dtmSecPrinted"
    t.datetime "dtmSecBillDate"
    t.integer  "last_action_id"
  end

  create_table "contact_types", :force => true do |t|
    t.string "contact_type_name"
  end

  create_table "fault_types", :force => true do |t|
    t.string "fault_name"
  end

  create_table "patients", :id => false, :force => true do |t|
    t.integer  "id",                               :null => false
    t.string   "patient_last_name",  :limit => 50
    t.string   "patient_first_name", :limit => 50
    t.string   "patient_mi",         :limit => 5
    t.datetime "patient_birth_date"
  end

  create_table "payers", :id => false, :force => true do |t|
    t.integer "id",                           :null => false
    t.string  "payer_name",     :limit => 50
    t.string  "payer_city",     :limit => 20
    t.string  "payer_state",    :limit => 2
    t.string  "payer_zip",      :limit => 10
    t.string  "payer_phone",    :limit => 25
    t.string  "payer_id",       :limit => 80
    t.integer "payer_fu_days"
    t.string  "payer_address1", :limit => 50
    t.string  "payer_address2", :limit => 50
  end

  create_table "reports", :force => true do |t|
    t.string "name"
    t.text   "code"
    t.text   "kind"
  end

  create_table "tasks", :force => true do |t|
    t.datetime "contact_date"
    t.integer  "claim_id"
    t.integer  "user_id"
    t.integer  "action_type_id"
    t.string   "comments"
    t.string   "contact_name"
    t.decimal  "expected_writeoff",  :precision => 9, :scale => 2
    t.decimal  "expected_payment",   :precision => 9, :scale => 2
    t.integer  "contact_type_id"
    t.boolean  "contract_violation"
    t.integer  "fault_type_id"
    t.string   "patient_resolution"
    t.integer  "payer_id"
    t.datetime "followup_date"
  end

  create_table "users", :force => true do |t|
    t.string "user_name"
  end

end
