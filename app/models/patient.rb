class Patient < ActiveRecord::Base
   has_many :claims
   has_many :tasks, :through=>:claims
  
end
