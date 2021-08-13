class CreateTopSecretDocs < ActiveRecord::Migration
  def change
    create_table :top_secret_docs do |t|
      t.string :title
      t.binary :encrypted_body, :limit => 1.megabyte
      t.integer :author_id

      t.timestamps
    end
  end
end
