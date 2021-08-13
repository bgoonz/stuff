class MissionsController < ApplicationController
  def index
    @missions = Mission.first(1000)
  end
end
