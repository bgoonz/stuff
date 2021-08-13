require 'net/http'

namespace :content do
  def sample_data_path(filename)
    dir = File.expand_path(File.join(File.dirname(__FILE__), '..', '..', 'db', 'sample_data'))
    File.join(dir, filename)
  end

  task :operatives => :environment do
    names_file = sample_data_path('names.txt')
    names = File.read(names_file).split("\n")
    names *= 5
    $stderr.puts "Creating #{names.size} Operatives"
    names.each do |name|
      Operative.create(:name => name)
    end
  end

  task :missions => :environment do
    colors_file = sample_data_path('colors.txt')
    animals_file = sample_data_path('animals.txt')
    colors = File.read(colors_file).split("\n")
    animals = File.read(animals_file).split("\n")
    codenames = []
    colors.each do |color|
      animals.each do |animal|
        codenames << "#{color} #{animal}"
      end
    end
    $stderr.puts "Creating #{codenames.size} missions"
    codenames.shuffle.each do |codename|
      Mission.create(:codename => codename, :priority => (rand(5) + 1))
    end
  end

  task :assign_missions => :environment do
    all_missions = Mission.all
    $stderr.puts "Assigning missions to #{Operative.count} operatives"
    Operative.find_each do |operative|
      operative.mission = all_missions.sample
      operative.save
    end
  end

  task :create_docs => :environment do
    n = 100
    STDERR.puts "Creating #{n} Top Secret Docs..."
    operatives = Operative.all
    n.times do |i|
      title = "Document #{i}"
      body = `fortune -n 100 -l | cowsay -f dragon.cow`
      author = operatives.sample
      TopSecretDoc.create(:title => title, :body => body, :author => author)
    end
  end

  task :generate => [:operatives, :missions, :assign_missions, :create_docs]
end
