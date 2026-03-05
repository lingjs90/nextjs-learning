import { fetchAllNews, formatNewsSummary } from "@/lib/rss_utils";
import { inngest } from "./client";
import { Resend } from "resend";

export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
  },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello, ${event.data.email}!` };
  },
);

export const sendDailyNews = inngest.createFunction(
  {
    id: "send-daily-news",
  },
  //   {
  //     event: "test/send.daily.news",
  //   },
  { cron: "26 0 * * *" },
  async ({ event, step }) => {
    // 1.从多个rss源获取新闻
    const newsItems = await step.run("fetch-news", async () => {
      console.log("Fetching news from RSS feeds...");
      const news = await fetchAllNews();
      console.log("Fetched news:", news.length);
      return news;
    });
    // 2.整理新闻为每日摘要
    const newsSummary = await step.run("format-news", async () => {
      console.log("Formatting news summary...");
      const summary = formatNewsSummary(newsItems);
      console.log("Formatted news summary:", summary);
      return summary;
    });
    // 3.创建邮件内容
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { data, error } = await step.run("create-email", async () => {
      console.log("Creating email content...");
      const result = await resend.broadcasts.create({
        from: "Daily Briefs <onboarding@resend.dev>",
        segmentId: "ea864d9e-02b1-4205-9cdc-835c7a2c84e5",
        subject: `Daily Briefs - ${new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}`,
        html: newsSummary.html,
      });
      console.log("Created email content:", result);
      return result;
    });
    if (error) {
      console.error("Failed to create email:", error);
      return { message: error.message };
    }
    // 4.发送邮件给订阅者
    const { error: sendError } = await step.run("send-email", async () => {
      console.log("Sending email to subscribers...");
      const result = await resend.broadcasts.send(data?.id!);
      return result;
    });
    if (sendError) {
      console.error("Failed to send email:", sendError);
      return { message: sendError.message };
    }
    return { message: "Daily news sent successfully!" };
  },
);
