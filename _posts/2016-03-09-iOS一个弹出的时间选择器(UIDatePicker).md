---
layout: post
title: iOS一个弹出的时间选择器视图(UIDatePicker)
category: iOS
date: 2016-03-09 08:20:13.000000000 +08:00
---
效果图:
![效果图](http://images2015.cnblogs.com/blog/893603/201603/893603-20160309085539616-2024330791.gif)

代码:
```objective-C
#define kScreen_Width [UIScreen mainScreen].bounds.size.width
#define kScreen_Height [UIScreen mainScreen].bounds.size.height

#import <UIKit/UIKit.h>

@protocol SYDatePickerDelegate <NSObject>

@optional
//当UIDatePicker值变化时所用到的代理
- (void)picker:(UIDatePicker *)picker ValueChanged:(NSDate *)date;

@end

@interface SYDatePicker : UIView

@property  (weak, nonatomic) id<SYDatePickerDelegate> delegate;

@property  (strong, nonatomic) UIDatePicker *picker;

- (void)showInView:(UIView *)view withFrame:(CGRect)frame andDatePickerMode:(UIDatePickerMode)mode;

- (void)dismiss;

- (void)valueChanged:(UIDatePicker *)picker;

@end

#import "SYDatePicker.h"

@implementation SYDatePicker

- (void)showInView:(UIView *)view withFrame:(CGRect)frame andDatePickerMode:(UIDatePickerMode)mode{
    self.frame = frame;
    self.backgroundColor = [UIColor lightGrayColor];
    
    if(!self.picker){
        self.picker = [[UIDatePicker alloc] initWithFrame:CGRectMake(0, 46, frame.size.width, frame.size.height - 38)];
    }
    
    self.picker.datePickerMode = mode;
    [self.picker addTarget:self action:@selector(valueChanged:) forControlEvents:UIControlEventValueChanged];
    [self addSubview:self.picker];
    
    UIButton *btnDone = [UIButton buttonWithType:UIButtonTypeSystem];
    btnDone.frame = CGRectMake(8, 8, 50, 30);
    [btnDone setTitle:@"完成" forState:UIControlStateNormal];
    [btnDone addTarget:self action:@selector(pickDone) forControlEvents:UIControlEventTouchUpInside];
    [self addSubview:btnDone];
    [view addSubview:self];
    
    self.frame = CGRectMake(0, kScreen_Height, kScreen_Width, 0);
    
    [UIView animateWithDuration:0.3 animations:^{
        self.frame = frame;
    }];
}

- (void)pickDone{
    if (![self.picker respondsToSelector:@selector(valueChanged:)]) {
        [self.delegate picker:self.picker ValueChanged:self.picker.date];
    }
    [self dismiss];
}

- (void)dismiss{
    [UIView animateWithDuration:0.3 animations:^{
         self.frame = CGRectMake(0, kScreen_Height, kScreen_Width, 0);
    } completion:^(BOOL finished) {
        [self removeFromSuperview];
    }];
}
```

<a href="https://github.com/Samoy/DatePickerDemo" target="_blank">源代码下载</a>
