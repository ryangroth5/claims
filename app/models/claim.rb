class Claim < ActiveRecord::Base
  has_many :tasks
  belongs_to :last_action, :class_name=>'Task',  :foreign_key=>'last_action_id'
  
   
  def last_action2
    return(Task.find(self.last_action_id))
  end
  def last_action2=(a)
    self.last_action_id = a.id;
    
  end
  
end
