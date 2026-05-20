using System.Security.Cryptography;
using System.Text;

namespace Autoservice.Helpers;

public static class PasswordHelper
{
    public static string Hash(string plainText)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(plainText));
        return Convert.ToHexString(bytes).ToLower();
    }
}
