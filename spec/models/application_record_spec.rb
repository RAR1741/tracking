require 'rails_helper'

RSpec.describe ApplicationRecord, type: :model do
  it 'is a subclass of ActiveRecord::Base' do
    expect(ApplicationRecord < ActiveRecord::Base).to be true
  end
end
