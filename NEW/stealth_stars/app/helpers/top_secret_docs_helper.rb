module TopSecretDocsHelper
  def format_encrypted_body(body, width=80)
    lines = []
    while body && !body.empty? do
      lines << body[0...width]
      body = body[width..-1]
    end
    lines.join("\n")
  end
end
