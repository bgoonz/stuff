class CreateOperatives < ActiveRecord::Migration
  def change
    create_table :operatives do |t|
      t.string :name
      t.integer :mission_id

      t.timestamps
    end
  end
end
