require 'application'
module Admin
  class BlogsController < ApplicationController
    # GET /blogs
    # GET /blogs.xml
    def index
      @blogs = Blog.find(:all)

      respond_to do |format|
        format.html # index.html.erb
        format.xml  { render :xml => @blogs }
      end
    end
    def rpm_status
      response = Net::HTTP.start('rpm.newrelic.com', 80) do | http |
        http.get('/status/mongrel')
      end
      if !(response.is_a? Net::HTTPSuccess)
        text =  "Unexpected response from server: #{response.code}: #{response.message}"
      else
        text = response.body
      end
      render :text => text
    end
    
    def readme
      render :file => "#{RAILS_ROOT}/README", :use_full_path => false
    end
    # GET /blogs/1
    # GET /blogs/1.xml
    def show
      @blog = Blog.find(params[:id])

      respond_to do |format|
        format.html # show.html.erb
        format.xml  { render :xml => @blog }
      end
    end

    # GET /blogs/new
    # GET /blogs/new.xml
    def new
      @blog = Blog.new

      respond_to do |format|
        format.html # new.html.erb
        format.xml  { render :xml => @blog }
      end

    end

    # GET /blogs/1/edit
    def edit
      @blog = Blog.find(params[:id])
    end

    # POST /blogs
    # POST /blogs.xml
    def create
      @blog = Blog.new(params[:blog])

      respond_to do |format|
        if @blog.save
          flash[:notice] = 'Blog was successfully created.'
          format.html { redirect_to(@blog) }
          format.xml  { render :xml => @blog, :status => :created, :location => @blog }
        else
          format.html { render :action => "new" }
          format.xml  { render :xml => @blog.errors, :status => :unprocessable_entity }
        end
      end
    end

    # PUT /blogs/1
    # PUT /blogs/1.xml
    def update
      @blog = Blog.find(params[:id])

      respond_to do |format|
        if @blog.update_attributes(params[:blog])
          flash[:notice] = 'Blog was successfully updated.'
          format.html { redirect_to(@blog) }
          format.xml  { head :ok }
        else
          format.html { render :action => "edit" }
          format.xml  { render :xml => @blog.errors, :status => :unprocessable_entity }
        end
      end
    end

    # DELETE /blogs/1
    # DELETE /blogs/1.xml
    def destroy
      @blog = Blog.find(params[:id])
      @blog.destroy

      respond_to do |format|
        format.html { redirect_to(blogs_url) }
        format.xml  { head :ok }
      end
    end
  end
end
