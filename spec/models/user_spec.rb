require "rails_helper"

RSpec.describe User do
  it "is invalid with invalid attributes" do
    user = described_class.new(email: "")
    expect(user).not_to be_valid
  end

  it "is valid with valid attributes" do
    user = described_class.new(email: "user@redalert1741.org")
    user.set_random_password

    expect(user).to be_valid
  end

  it "creates a system user if one doesn't exist" do
    expect(described_class.count).to eq(0)
    described_class.system_user
    expect(described_class.count).to eq(1)
  end

  it "doesn't create a system user if one exists" do
    described_class.system_user
    expect(described_class.count).to eq(1)
    described_class.system_user
    expect(described_class.count).to eq(1)
  end

  it "sets a random password" do
    user = described_class.new(email: "")
    user.set_random_password

    expect(user.password).to be_present
    expect(user.password_confirmation).to be_present
  end
end
