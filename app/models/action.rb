class Action < ActiveRecord::Base
   belongs_to :claim
   belongs_to :payer
   belongs_to :action_type
   belongs_to :contact_type
   belongs_to :fault_type
   
end
