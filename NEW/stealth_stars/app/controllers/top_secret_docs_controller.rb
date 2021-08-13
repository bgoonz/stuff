class TopSecretDocsController < ApplicationController
  def index
    @docs = TopSecretDoc.includes(:author).first(100)
  end

  def show
    @doc = TopSecretDoc.find(params[:id])
  end
end