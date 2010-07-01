class Patient < ActiveRecord::Base
   has_many :claims
   has_many :actions, :through=>:claims
  
end
