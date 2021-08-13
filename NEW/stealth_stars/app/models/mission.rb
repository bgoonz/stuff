class Mission < ActiveRecord::Base
  attr_accessible :codename, :priority
  has_many :operatives
end
