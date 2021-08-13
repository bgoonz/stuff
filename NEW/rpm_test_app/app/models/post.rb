class Post < ActiveRecord::Base
  belongs_to :blog
  named_scope :published, :conditions => {:published => true}

  after_save do
    sleep 5
  end

  def evaluate
    # does nothing
  end
  
end
