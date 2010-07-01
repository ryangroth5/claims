class Claim < ActiveRecord::Base
  has_many :actions
  has_one :last_action, :foreign_key=>'last_action_id', :class_name=>:action
  
end
