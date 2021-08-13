import wx


class MyFrame(wx.Frame):
    def __init__(self):
        super().__init__(parent=None, title="Note Taking", pos=wx.Point(0, 0))
        panel = wx.Panel(self)
        my_sizer = wx.BoxSizer(wx.VERTICAL)
        self.my_btn = wx.Button(panel, label="New Note")
        self.my_btn.Bind(wx.EVT_BUTTON, self.on_press)
        my_sizer.Add(self.my_btn, 0, wx.ALL, 5)
        panel.SetSizer(my_sizer)
        self.Show()

    def on_press(self, event):
        print("Button Pressed")


if __name__ == "__main__":
    app = wx.App()
    frame = MyFrame()
    app.MainLoop()
