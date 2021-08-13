class Operative < ActiveRecord::Base
  attr_accessible :name

  belongs_to :mission
end
