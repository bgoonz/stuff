class CreateMissions < ActiveRecord::Migration
  def change
    create_table :missions do |t|
      t.string :codename
      t.integer :priority

      t.timestamps
    end
  end
end
