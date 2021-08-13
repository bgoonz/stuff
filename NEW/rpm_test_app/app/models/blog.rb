class Blog < ActiveRecord::Base
  belongs_to :author
  has_many :posts
end
