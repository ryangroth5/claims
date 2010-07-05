class Task < ActiveRecord::Base
   belongs_to :claim
   belongs_to :payer
   belongs_to :action_type
   belongs_to :contact_type
   belongs_to :fault_type
   
   
   after_create :link_claim
   
   
  def link_claim
    c = self.claim;
    if(!c.nil?)
      c.last_action_id = self.id;
      c.save;
    end
  
  end

  
end
