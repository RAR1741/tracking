require "rails_helper"

RSpec.describe ApplicationRecord do
  it "is a subclass of ActiveRecord::Base" do
    expect(described_class < ActiveRecord::Base).to be true
  end
end
