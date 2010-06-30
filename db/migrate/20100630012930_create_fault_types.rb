class CreateFaultTypes < ActiveRecord::Migration
  def self.up
    create_table :fault_types do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :fault_types
  end
end
