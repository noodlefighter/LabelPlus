using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Forms;

namespace OpenCCEntry
{
    /// <summary>
    /// C# Interface to an OpenCC instance.
    /// Will create a new OpenCC instance.
    /// </summary>
    public class OpenCC
    {
        private const string OpenCCLoc = "opencc/opencc.dll";
        private const string DefaultConfig = "opencc/s2t.json";

        [DllImport(OpenCCLoc, CallingConvention = CallingConvention.Cdecl)]
        private static extern IntPtr opencc_open([MarshalAs(UnmanagedType.LPStr)] string configFileName);

        [DllImport(OpenCCLoc, CallingConvention = CallingConvention.Cdecl)]
        private static extern IntPtr opencc_open_w([MarshalAs(UnmanagedType.LPWStr)] string configFileName);

        [DllImport(OpenCCLoc, CallingConvention = CallingConvention.Cdecl)]
        private static extern int opencc_close(IntPtr opencc);

        [DllImport(OpenCCLoc, CallingConvention = CallingConvention.Cdecl)]
        private static extern unsafe int opencc_convert_utf8_to_buffer(IntPtr opencc, byte* input, int length, byte* output);

        [DllImport(OpenCCLoc, CallingConvention = CallingConvention.Cdecl)]
        private static extern IntPtr opencc_error();

        private IntPtr openccInstance = new IntPtr(0);
        private int protectLength = 0;

        /// <summary>
        /// Create a new instance of OpenCC converter.
        /// </summary>
        /// <param name="configFileName">Location of configuration file.</param>
        /// <param name="buffProtect">Prevent memory leak in unsafe code.</param>
        public OpenCC(string configFileName = DefaultConfig, int buffProtect = 2000)
        {
            openccInstance = opencc_open_w(configFileName);
            protectLength = buffProtect;
            if (openccInstance == new IntPtr(-1))
                throw new Exception(Marshal.PtrToStringAnsi(opencc_error()));
        }

        /// <summary>
        /// Close the OpenCC instance when dispose.
        /// </summary>
        ~OpenCC()
        {
            try { opencc_close(openccInstance); }
            catch (BadImageFormatException) { MessageBox.Show("OpenCCEntry: Please Rebuild Program Specifying x86/x64"); }
            catch (Exception ec) { MessageBox.Show(string.Format("OpenCCEntry: {1}\n{2}", ec.GetType(), ec.Message)); }
        }

        /// <summary>
        /// Convert string content using OpenCC converter.
        /// </summary>
        /// <param name="input">Source string.</param>
        /// <returns>Convert Result.</returns>
        unsafe public string Convert(string input)
        {
            var src = Encoding.UTF8.GetBytes(input);
            var dst = new byte[src.Length + protectLength];

            int resultLength = 0;
            fixed (byte* ptr = src, optr = dst)
            { resultLength = opencc_convert_utf8_to_buffer(openccInstance, ptr, src.Length, optr); }
            if (resultLength == -1)
                throw new Exception(Marshal.PtrToStringAnsi(opencc_error()));

            return Encoding.UTF8.GetString(dst, 0, resultLength);
        }
    }
}