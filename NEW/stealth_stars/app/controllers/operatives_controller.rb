class OperativesController < ApplicationController
  def index
    @operatives = Operative.all
  end
end